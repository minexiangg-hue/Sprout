#!/usr/bin/env python3
"""Use the untouched upstream prompt/extractor functions without importing paid-provider SDKs."""
import ast
import json
import os
import pathlib
import sys
repo, mode, filename = sys.argv[1:4]
source = pathlib.Path(repo, 'generate_code.py').read_text()
tree = ast.parse(source)
functions = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in {'extract_code', 'generate_implementation'}]
namespace = {'os': os, 'json': json, 'CodeGenerator': object}
exec(compile(ast.Module(body=functions, type_ignores=[]), str(pathlib.Path(repo, 'generate_code.py')), 'exec'), namespace)
if mode == 'prompt':
    class Capture:
        def generate_code(self, prompt):
            sys.stdout.write(prompt)
            return ''
    namespace['generate_implementation'](filename, Capture())
elif mode == 'extract':
    sys.stdout.write(namespace['extract_code'](pathlib.Path(filename).read_text()))
else:
    raise ValueError('Expected prompt or extract')
