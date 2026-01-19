"use client";

import React from "react";
import PolicyMapClient from "./PolicyMapClient";
import type { DistrictDatum } from "../types/indesx";

type Props = {
  data: DistrictDatum[];
};

export default function PolicyMapLoader({ data }: Props) {
  return (
    // keep this wrapper minimal — PolicyMapClient handles everything client-side
    <div className="w-full h-[500px]">
      <PolicyMapClient data={data} />
    </div>
  );
}
