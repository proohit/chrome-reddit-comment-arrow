import { FC, PropsWithChildren, useEffect } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { DEFAULT_OPTIONS } from "../constants/default-options";
import { EXTENSION_WRAPPER } from "../constants/extension-wrapper";

export const ColorManager: FC<PropsWithChildren> = (props) => {
  const [userSelectedStroke] = useChromeStorageLocal(
    "stroke",
    DEFAULT_OPTIONS.stroke
  );
  const [userSelectedFill] = useChromeStorageLocal(
    "fill",
    DEFAULT_OPTIONS.fill
  );

  const [customStrokeEnabled] = useChromeStorageLocal(
    "strokeEnabled",
    DEFAULT_OPTIONS.strokeEnabled
  );
  const [customFillEnaled] = useChromeStorageLocal(
    "fillEnabled",
    DEFAULT_OPTIONS.fillEnabled
  );

  useEffect(() => {
    const style = document.getElementById(EXTENSION_WRAPPER).style;

    style.setProperty(
      "--arrow-stroke-light",
      customStrokeEnabled ? userSelectedStroke : "#0a0a0a"
    );
    style.setProperty(
      "--arrow-stroke-dark",
      customStrokeEnabled ? userSelectedStroke : "#f2f3f5"
    );

    style.setProperty(
      "--arrow-fill-light",
      customFillEnaled ? userSelectedFill : "#f2f3f5"
    );
    style.setProperty(
      "--arrow-fill-dark",
      customFillEnaled ? userSelectedFill : "#292929"
    );
  }, [
    userSelectedStroke,
    userSelectedFill,
    customStrokeEnabled,
    customFillEnaled,
  ]);
  return props.children;
};
