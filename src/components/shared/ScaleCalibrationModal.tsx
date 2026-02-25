import { useState } from "react";
import { X, Ruler, ArrowRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CalibrationData {
    distance: number;
    unit: string;
    precision: string;
    separateXY: boolean;
}

interface ScaleCalibrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCalibrate: (data: CalibrationData) => void;
    pixelDistanceX: number;
    pixelDistanceY: number;
}

export function ScaleCalibrationModal({ isOpen, onClose, onCalibrate, pixelDistanceX, pixelDistanceY }: ScaleCalibrationModalProps) {
    const [distance, setDistance] = useState("1.0");
    const [unit, setUnit] = useState("ft");
    const [precision, setPrecision] = useState("0.01");
    const [separateXY, setSeparateXY] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCalibrate({
            distance: parseFloat(distance),
            unit,
            precision,
            separateXY
        });
    };

    // Calculate a rough preview scale if both are > 0, just to visually reinforce to the user what they are doing.
    const previewScale = Math.max(pixelDistanceX, pixelDistanceY) > 0
        ? (parseFloat(distance) / Math.max(pixelDistanceX, pixelDistanceY)).toFixed(4)
        : "0.0000";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-800/50">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <Ruler className="h-5 w-5 text-accent-teal" />
                        <span>Calibrate Drawing Scale</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-6 text-sm">
                    {/* Visual Indicator of the line just drawn */}
                    <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 pattern-dots pattern-white/5 pattern-size-4"></div>
                        <div className="relative z-10 flex items-center gap-4 text-slate-400 font-mono text-xs w-full max-w-[250px] my-2">
                            <div className="h-3 w-3 rounded-full border-2 border-primary bg-slate-900 shrink-0"></div>
                            <div className="flex-1 h-0.5 bg-primary relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-primary font-bold">
                                    {Math.round(Math.max(pixelDistanceX, pixelDistanceY))} pts
                                </div>
                            </div>
                            <div className="h-3 w-3 rounded-full border-2 border-primary bg-slate-900 shrink-0"></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-slate-300 font-semibold">Known Distance</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={distance}
                                    onChange={(e) => setDistance(e.target.value)}
                                    className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                                    placeholder="Enter length..."
                                />
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="w-24 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary shadow-inner"
                                >
                                    <option value="ft">ft</option>
                                    <option value="in">in</option>
                                    <option value="m">m</option>
                                    <option value="mm">mm</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-2 text-slate-300">
                            <label className="font-semibold flex items-center gap-2">
                                <Settings2 className="h-4 w-4 text-slate-400" />
                                Precision
                            </label>
                            <select
                                value={precision}
                                onChange={(e) => setPrecision(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary shadow-inner"
                            >
                                <option value="1">1 (Whole number)</option>
                                <option value="0.1">0.1</option>
                                <option value="0.01">0.01</option>
                                <option value="0.001">0.001</option>
                                <option value="1/8">1/8 (Fractional)</option>
                                <option value="1/16">1/16 (Fractional)</option>
                            </select>
                        </div>

                        <div className="text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/5 flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                            <p>Once set, 1 PDF point will map to approx <strong className="text-slate-200">{previewScale} {unit}</strong>. All lines, area polygons, and auto-takeoffs will scale dynamically.</p>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(37,89,244,0.3)]">
                            Apply Scale
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
