import React from "react";
import type { FC } from "react";
import { BufferGeometry, BufferAttribute } from "three";

interface Props {
  from: [number, number, number];
  to: [number, number, number];
}

const Line: FC<Props> = (props) => {
  const lineGeometry = (() => {
    const g = new BufferGeometry();
    const vertices = [...props.from, ...props.to];
    g.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(vertices), 3)
    );
    return g;
  })();
  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial linewidth={5} color="red" />
    </lineSegments>
  );
};

export default Line;
