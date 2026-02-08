# Services Directory

This directory contains PHP scripts that appear to be from a previous version of the application or intended for a backend environment.

**Current Status:**
These files are **not** used by the current React/Vite frontend application. The frontend currently fetches data from:
1. Static files in the `public` directory.
2. External URLs (e.g., `http://s-iihr50.iihr.uiowa.edu/`).

**Files:**
- `get_boundary.php`
- `read_usgs.php`
- `read_tar.php`
- etc.

If a backend is required in the future, these scripts might need to be integrated or rewritten (e.g., as Node.js services or kept as PHP behind a proxy), but for the current "client-side only" development setup, they are dormant.
