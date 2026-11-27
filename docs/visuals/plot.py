"""Render the benchmark figure from the saved trials with matplotlib."""
import json
from pathlib import Path
from statistics import median

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

folder = Path(__file__).resolve().parent
data = json.loads((folder / "browser-benchmark.json").read_text())["bundles"]
fig, axes = plt.subplots(2, 2, figsize=(10, 6), layout="constrained")
labels = ["WMCP core", "W3C", "Core + Zig", "Core + Rust"]
colors = ["#126653", "#315686", "#526374", "#526374"]
for ax, (metric, title) in zip(axes.flat, [
    ("gzip_bytes", "Standalone download (KiB, gzip)"),
    ("register", "Register one tool (µs)"),
    ("discover", "List all 32 tools (µs)"),
    ("execute", "Call and verify an echo tool (µs)"),
]):
    for i, (name, bundle) in enumerate(data.items()):
        samples = ([bundle[metric] / 1024] if metric == "gzip_bytes"
                   else [trial[metric] for trial in bundle["trials"]])
        value = median(samples)
        ax.barh(i, value, height=.45, color=colors[i])
        ax.text(value, i, f"  {value:.2f}", va="center", fontsize=10)
    ax.set_yticks(range(4), labels)
    ax.invert_yaxis()
    ax.set_xlim(0, ax.get_xlim()[1] * 1.24)
    ax.set_title(title, loc="left", weight="bold", fontsize=12)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.tick_params(axis="y", length=0)
fig.savefig(folder / "browser-benchmark.png", dpi=170, facecolor="white")
