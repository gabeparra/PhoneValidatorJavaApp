#!/usr/bin/env python3
"""Wrapper script to start RQ worker"""
import sys
import os

# Add venv to path
venv_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(venv_path, 'venv', 'lib', 'python3.12', 'site-packages'))

# Import and run RQ CLI
from rq.cli import main

if __name__ == '__main__':
    sys.argv = ['rq', 'worker', 'phone-validation', '--url', 'redis://localhost:6379/0']
    main()

