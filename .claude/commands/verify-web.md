Verify the web editor builds and runs correctly.

Steps:
1. Run `cd /Users/tim/contriband-web && npm run build` and check for TypeScript or build errors.
2. Start the dev server in background: `cd /Users/tim/contriband-web && npx vite --port 5199` (use port 5199 to avoid conflicts).
3. Wait 3 seconds for the server to start.
4. Use the Chrome MCP tools to navigate to http://localhost:5199 in a new tab and take a screenshot.
5. Check the browser console for errors using `read_console_messages` with pattern "error|Error|warning".
6. Stop the background dev server.
7. Report: build status, screenshot confirmation, any console errors found.

If the build fails, show the errors and stop - don't start the dev server.
