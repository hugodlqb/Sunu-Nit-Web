import Image from "next/image";
import type { ImageData } from "@/data/images";

interface Props {
    image: ImageData;
    className?: string;
    priority?: boolean;
}

export default function AppImage({
    image,
    className,
    priority = false,
}: Props) {
    return (
        <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={priority}
            className={className}
        />
    );
}

export function AppImageFill({
    image,
    className,
    priority = false,
}: Props) {
    return (
        <Image
            src={image.url}
            alt={image.alt}
            fill
            priority={priority}
            sizes="100vw"
            className={className}
        />
    );
}