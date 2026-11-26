"use client";
import { useEffect } from "react";
import { writeBasket } from "@/lib/basket";
export default function ClearBasket() { useEffect(() => { writeBasket([]); }, []); return null; }
