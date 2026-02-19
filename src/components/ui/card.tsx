"use client";
import * as React from "react"

import { cn } from "@/lib/utils"
// ICON PATCH: lucide-react icons replaced with <span /> for build isolation

const Card = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export { Card };
export const CardHeader = Card;
export const CardTitle = Card;
export const CardDescription = Card;
export const CardContent = Card;
export const CardFooter = Card;






