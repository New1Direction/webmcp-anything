#!/usr/bin/env python3
"""Encode a WMCP ontology and queries with a local, pinned MiniLM model."""

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

MODEL = "sentence-transformers/all-MiniLM-L6-v2@1110a243fdf4706b3f48f1d95db1a4f5529b4d41"
MODEL_FILES = {
    "model.onnx": "6fd5d72fe4589f189f8ebc006442dbb529bb7ce38f8082112682524616046452",
    "tokenizer.json": "be50c3628f2bf5bb5e3a7f17b1f74611b2561a3a27eeab05e5aa30f411572037",
}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ontology", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--query", action="append", default=[])
    parser.add_argument("--tasks", type=Path)
    args = parser.parse_args()

    ontology = read_json(args.ontology)
    if ontology["schemaVersion"] != "wmcp-capability-ontology/v1":
        parser.error("Expected a wmcp-capability-ontology/v1 export")
    texts = [entry["searchText"] for entry in ontology["capabilities"]] + args.query
    if args.tasks:
        texts.extend(item["goal"] for item in read_json(args.tasks)["tasks"])
    texts = list(dict.fromkeys(texts))

    for filename, expected in MODEL_FILES.items():
        with (args.model_dir / filename).open("rb") as source:
            if hashlib.file_digest(source, "sha256").hexdigest() != expected:
                parser.error("Model file does not match the pinned revision: " + filename)

    tokenizer = Tokenizer.from_file(str(args.model_dir / "tokenizer.json"))
    tokenizer.enable_truncation(max_length=256)
    tokenizer.enable_padding()
    settings = ort.SessionOptions()
    settings.intra_op_num_threads = 1
    settings.inter_op_num_threads = 1
    session = ort.InferenceSession(str(args.model_dir / "model.onnx"), sess_options=settings,
                                   providers=["CPUExecutionProvider"])

    vectors = {}
    for start in range(0, len(texts), 32):
        batch = texts[start:start + 32]
        encoded = tokenizer.encode_batch(batch)
        mask = np.asarray([entry.attention_mask for entry in encoded], dtype=np.int64)
        tokens, = session.run(["last_hidden_state"], {
            "input_ids": np.asarray([entry.ids for entry in encoded], dtype=np.int64),
            "attention_mask": mask,
            "token_type_ids": np.asarray([entry.type_ids for entry in encoded], dtype=np.int64),
        })
        masked = mask[:, :, None]
        embeddings = (tokens * masked).sum(axis=1) / masked.sum(axis=1)
        embeddings /= np.linalg.norm(embeddings, axis=1, keepdims=True)
        for text, vector in zip(batch, embeddings, strict=True):
            digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
            vectors[digest] = [round(float(value), 8) for value in vector]

    document = {"schemaVersion": "wmcp-embeddings/v1", "model": MODEL, "dimensions": 384, "vectors": vectors}
    args.output.write_text(json.dumps(document, separators=(",", ":")) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
