import Foundation
import AVFoundation
import CoreGraphics
import ImageIO

let videoPath = "/Users/rajadityaaa23/Desktop/DEVYRO/public/videos/videos/website_reference.mp4"
let outputDir = "/Users/rajadityaaa23/Desktop/DEVYRO/public/images/frames"

let fileManager = FileManager.default
try? fileManager.createDirectory(atPath: outputDir, withIntermediateDirectories: true)

let asset = AVURLAsset(url: URL(fileURLWithPath: videoPath))
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero

let duration = CMTimeGetSeconds(asset.duration)
print("Video duration: \(duration) seconds")

// Extract 1 frame per second or every 0.5s
var times: [NSValue] = []
var t: Double = 0
while t < duration {
    let cmTime = CMTime(seconds: t, preferredTimescale: 600)
    times.append(NSValue(time: cmTime))
    t += 0.8
}

var frameIndex = 0
for val in times {
    let cmTime = val.timeValue
    do {
        let imageRef = try generator.copyCGImage(at: cmTime, actualTime: nil)
        let outPath = "\(outputDir)/frame_\(String(format: "%03d", frameIndex)).jpg"
        let url = URL(fileURLWithPath: outPath) as CFURL
        if let dest = CGImageDestinationCreateWithURL(url, "public.jpeg" as CFString, 1, nil) {
            CGImageDestinationAddImage(dest, imageRef, nil)
            CGImageDestinationFinalize(dest)
            print("Extracted frame \(frameIndex) at \(cmTime.seconds)s -> \(outPath)")
        }
        frameIndex += 1
    } catch {
        print("Failed to extract frame at \(cmTime.seconds): \(error)")
    }
}
print("Done extracting \(frameIndex) frames.")
