//
//  opfsWriteWorker.js
//  Estrelas (web)
//
//  Writes files to the browser's private storage with synchronous access handles, for browsers (Safari) whose file
//  handles have no createWritable. The file is written to a temporary name and then moved over the real one where the
//  browser allows it, so readers don't see half a file.
//

self.onmessage = async ({ data }) => {
    const { id, path, bytes } = data;
    try {
        let directory = await navigator.storage.getDirectory();
        for (const segment of path.slice(0, -1)) directory = await directory.getDirectoryHandle(segment, { create: true });
        const name = path[path.length - 1];
        const temporary = await directory.getFileHandle(`.${name}.writing`, { create: true });
        const access = await temporary.createSyncAccessHandle();
        access.truncate(0);
        access.write(bytes, { at: 0 });
        access.flush();
        access.close();
        if (typeof temporary.move === 'function') {
            try {
                await directory.removeEntry(name);
            } catch {
                // There was nothing to replace
            }
            await temporary.move(directory, name);
        } else {
            const file = await directory.getFileHandle(name, { create: true });
            const target = await file.createSyncAccessHandle();
            target.truncate(0);
            target.write(bytes, { at: 0 });
            target.flush();
            target.close();
            await directory.removeEntry(`.${name}.writing`);
        }
        self.postMessage({ id });
    } catch (error) {
        self.postMessage({ id, error: String(error?.message ?? error) });
    }
};
