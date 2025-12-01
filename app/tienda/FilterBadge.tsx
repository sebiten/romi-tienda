"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

function FilterBadge({ label, onRemove }: any) {
    return (
        <Badge className="px-3 py-1 flex items-center gap-1 border">
            {label}
            <button onClick={onRemove}>
                <X className="w-3 h-3" />
            </button>
        </Badge>
    );
}

export default memo(FilterBadge);
