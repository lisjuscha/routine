import sharp from 'sharp'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const svg = readFileSync(path.join(publicDir, 'icon.svg'))

await sharp(svg).resize(192).png().toFile(path.join(publicDir, 'icon-192.png'))
await sharp(svg).resize(512).png().toFile(path.join(publicDir, 'icon-512.png'))
await sharp(svg).resize(180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'))

console.log('Icons generated: icon-192.png, icon-512.png, apple-touch-icon.png')
