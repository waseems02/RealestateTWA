"use client";

import dynamic from "next/dynamic";
import type { Listing } from "@/lib/db-types";

const MapClient = dynamic(() => import("./map-client"), { ssr: false });

export default function MapClientDynamic({ listings }: { listings: Listing[] }) {
  return <MapClient listings={listings} />;
}
