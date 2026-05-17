'use client';

import dynamic from "next/dynamic";

const MirrorDemo = dynamic(() => import("./MirrorDemo"), { ssr: false });

export default function MirrorWrapper() {
  return <MirrorDemo />;
}
