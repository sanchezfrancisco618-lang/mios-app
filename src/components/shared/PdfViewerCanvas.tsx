"use client";

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader2 } from 'lucide-react';

// Next.js specific setup for pdf.js worker
// Next.js specific setup for pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import { ScaleCalibrationModal, CalibrationData } from './ScaleCalibrationModal';

interface Point {
    x: number;
    y: number;
}

interface PdfViewerCanvasProps {
    fileUrl: string;
    projectId: string;
    fileId: string;
    activeTool: string;
    scale?: number;
}

export function PdfViewerCanvas({ fileUrl, projectId, fileId, activeTool, scale = 1.0 }: PdfViewerCanvasProps) {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    // Canvas State
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentLine, setCurrentLine] = useState<{ start: Point; end: Point | null } | null>(null);

    // DB State
    const [calibration, setCalibration] = useState<any>(null);
    const [markups, setMarkups] = useState<any[]>([]);

    // Modal State
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [pendingLine, setPendingLine] = useState<{ start: Point; end: Point } | null>(null);

    // Fetch initial data
    useEffect(() => {
        const loadData = async () => {
            const pageRes = await fetch(`/api/projects/${projectId}/files/${fileId}/pages/${pageNumber}`);
            if (pageRes.ok) {
                const config = await pageRes.json();
                if (config?.scaleX) {
                    setCalibration(config);
                    // fetch markups if calibrated
                    const markupsRes = await fetch(`/api/projects/${projectId}/files/${fileId}/pages/${pageNumber}/markups`);
                    if (markupsRes.ok) {
                        setMarkups(await markupsRes.json());
                    }
                }
            }
        };
        loadData();
    }, [projectId, fileId, pageNumber]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    // Handle Canvas Drawing for Measurement
    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
        if (activeTool !== 'measure') return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setCurrentLine({ start: { x, y }, end: null });
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || activeTool !== 'measure' || !currentLine) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCurrentLine(prev => prev ? { ...prev, end: { x, y } } : null);
    };

    const handleMouseUp = async () => {
        if (activeTool === 'measure' && isDrawing && currentLine?.end) {
            const finishedLine = { start: currentLine.start, end: currentLine.end };

            if (!calibration) {
                // Trigger Calibration Modal
                setPendingLine(finishedLine);
                setIsCalibrating(true);
            } else {
                // Immediately persist new measurement markup
                const dx = finishedLine.end.x - finishedLine.start.x;
                const dy = finishedLine.end.y - finishedLine.start.y;
                const pixelDistance = Math.sqrt(dx * dx + dy * dy);
                const realWorldDistance = (pixelDistance * calibration.scaleX).toFixed(2);

                // Construct Geometry JSON (saving in raw pixels relative to scale for now)
                const geometry = JSON.stringify([{ x: finishedLine.start.x, y: finishedLine.start.y }, { x: finishedLine.end.x, y: finishedLine.end.y }]);

                const res = await fetch(`/api/projects/${projectId}/files/${fileId}/pages/${pageNumber}/markups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'LENGTH',
                        geometry,
                        color: '#2559f4',
                        strokeWidth: 3
                    })
                });

                if (res.ok) {
                    const newMarkup = await res.json();
                    setMarkups(prev => [...prev, newMarkup]);
                }
            }
        }
        setIsDrawing(false);
        setCurrentLine(null);
    };

    const handleCalibrationSubmit = async (data: CalibrationData) => {
        if (!pendingLine) return;

        const dx = pendingLine.end.x - pendingLine.start.x;
        const dy = pendingLine.end.y - pendingLine.start.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);

        // Calculate scale (units per pixel)
        const scale = data.distance / pixelDistance;

        const payload = {
            scaleX: scale,
            scaleY: data.separateXY ? scale : scale, // For simplicity, adopting uniform scaling unless advanced features are added later.
            unit: data.unit,
            precision: data.precision
        };

        const res = await fetch(`/api/projects/${projectId}/files/${fileId}/pages/${pageNumber}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const config = await res.json();
            setCalibration(config);
            setIsCalibrating(false);
            setPendingLine(null);
        }
    };

    // Redraw canvas whenever lines change or current line is active
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw saved markups from DB
        markups.forEach(markup => {
            if (markup.type === 'LENGTH') {
                const geom = JSON.parse(markup.geometry);
                if (geom.length === 2) {
                    ctx.strokeStyle = markup.color;
                    ctx.lineWidth = markup.strokeWidth;
                    ctx.lineCap = 'round';

                    ctx.beginPath();
                    ctx.moveTo(geom[0].x, geom[0].y);
                    ctx.lineTo(geom[1].x, geom[1].y);
                    ctx.stroke();

                    // Endpoints
                    ctx.fillStyle = '#14b8a6';
                    ctx.beginPath();
                    ctx.arc(geom[0].x, geom[0].y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(geom[1].x, geom[1].y, 4, 0, Math.PI * 2);
                    ctx.fill();

                    // Text Label (if calibrated)
                    if (calibration) {
                        const dx = geom[1].x - geom[0].x;
                        const dy = geom[1].y - geom[0].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const realVal = (dist * calibration.scaleX).toFixed(2);

                        ctx.font = 'bold 12px Inter, sans-serif';
                        ctx.fillStyle = '#1e293b';
                        const text = `${realVal} ${calibration.unit}`;
                        const textWidth = ctx.measureText(text).width;

                        const mx = (geom[0].x + geom[1].x) / 2;
                        const my = (geom[0].y + geom[1].y) / 2;

                        // Background pill
                        ctx.fillStyle = 'rgba(255,255,255,0.9)';
                        ctx.beginPath();
                        ctx.roundRect(mx - textWidth / 2 - 6, my - 14, textWidth + 12, 20, 4);
                        ctx.fill();
                        ctx.strokeStyle = markup.color;
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        ctx.fillStyle = '#0f172a';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(text, mx, my - 4);
                    }
                }
            }
        });

        // Draw current active line
        if (currentLine && currentLine.end) {
            ctx.strokeStyle = 'rgba(37, 89, 244, 0.5)';
            ctx.beginPath();
            ctx.moveTo(currentLine.start.x, currentLine.start.y);
            ctx.lineTo(currentLine.end.x, currentLine.end.y);
            ctx.stroke();
        }

    }, [markups, currentLine, calibration]);

    const handlePageRenderSuccess = () => {
        // Match canvas size to the rendered PDF page size
        const canvas = canvasRef.current;
        const pdfLayer = containerRef.current?.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;

        if (canvas && pdfLayer) {
            canvas.width = pdfLayer.clientWidth;
            canvas.height = pdfLayer.clientHeight;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full flex justify-center bg-slate-900 overflow-auto py-8">
            <div className="relative shadow-2xl bg-white select-none">
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex items-center justify-center p-24 text-slate-500 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="font-semibold text-lg">Parsing PDF Data...</span>
                        </div>
                    }
                    error={<div className="p-12 text-red-500 font-bold">Failed to load PDF. Check the file URL or CORS.</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        onRenderSuccess={handlePageRenderSuccess}
                        className="pointer-events-none" // Let mouse events pass up to our overlay
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </Document>

                {/* Interactive Canvas Overlay */}
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair z-10"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseOut={handleMouseUp}
                    style={{ pointerEvents: activeTool === 'pan' ? 'none' : 'auto' }}
                />

                <ScaleCalibrationModal
                    isOpen={isCalibrating}
                    onClose={() => { setIsCalibrating(false); setPendingLine(null); }}
                    onCalibrate={handleCalibrationSubmit}
                    pixelDistanceX={pendingLine ? Math.abs(pendingLine.end.x - pendingLine.start.x) : 0}
                    pixelDistanceY={pendingLine ? Math.abs(pendingLine.end.y - pendingLine.start.y) : 0}
                />
            </div>
        </div>
    );
}
