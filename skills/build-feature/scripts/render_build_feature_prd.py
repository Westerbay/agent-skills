#!/usr/bin/env python3
"""Render feature JSON using the document engine bundled with this skill."""
import argparse
from pathlib import Path
import subprocess
import sys

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('output', nargs='?', type=Path)
parser.add_argument('--plan', type=Path)
parser.add_argument('--state', type=Path)
parser.add_argument('--browser', type=Path)
parser.add_argument('--diagram-source', action='store_true')
args = parser.parse_args()
if args.source.suffix.lower() != '.json':
    parser.error('Feature documents use JSON; existing Markdown must be preserved separately.')
renderer = Path(__file__).resolve().parents[1] / 'modules/prd/scripts/prd.mjs'
command = ['node', str(renderer), 'render', str(args.source)]
for flag, value in [('--out', args.output), ('--plan', args.plan), ('--state', args.state), ('--browser', args.browser)]:
    if value is not None:
        command.extend([flag, str(value)])
if args.diagram_source:
    command.append('--diagram-source')
try:
    sys.exit(subprocess.run(command).returncode)
except FileNotFoundError:
    parser.error('Node.js 22+ is required; the node executable was not found.')
