import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

async function addJsExtensions(dir) {
    const files = await readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
        const fullPath = join(dir, file.name);
        
        if (file.isDirectory()) {
            await addJsExtensions(fullPath);
        } else if (file.isFile() && extname(file.name) === '.js') {
            let content = await readFile(fullPath, 'utf-8');
            
            // Add .js to relative imports that don't already have it
            content = content.replace(
                /from ['"](\.[^'"]+)(['"])/g,
                (match, path, quote) => {
                    if (path.endsWith('.js') || path.endsWith('.json')) {
                        return match;
                    }
                    return `from '${path}.js${quote}`;
                }
            );
            
            await writeFile(fullPath, content, 'utf-8');
        }
    }
}

console.log('Adding .js extensions to compiled files...');
await addJsExtensions('./dist');
console.log('✓ Done!');