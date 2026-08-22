import { useId } from "react";

// Maps a tooltip alignment to its position classes and matching arrow offset.
// Edge-anchored variants (left/right) keep the tooltip from clipping past the
// viewport when the trigger sits at the start or end of the footer link row.
const ALIGN = {
  left: { tooltip: "left-0", arrow: "left-6 -translate-x-1/2" },
  center: { tooltip: "left-1/2 -translate-x-1/2", arrow: "left-1/2 -translate-x-1/2" },
  right: { tooltip: "right-0", arrow: "right-6 translate-x-1/2" },
};

const FooterPolicyLink = ({ label, description, align = "center" }) => {
  const tooltipId = useId();
  const { tooltip, arrow } = ALIGN[align] ?? ALIGN.center;

  return (
    <a
      tabIndex={0}
      aria-describedby={tooltipId}
      className="group relative hover:text-white focus:text-white focus:outline-none transition-colors duration-300 cursor-help"
    >
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 -inset-2"></div>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full ${tooltip} mb-3 w-56 max-w-[calc(100vw-2rem)] rounded-lg bg-gray-800/95 backdrop-blur px-3 py-2 text-xs text-gray-200 shadow-xl ring-1 ring-white/10 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0 transition-all duration-300 z-20`}
      >
        {description}
        <span
          className={`absolute top-full ${arrow} border-4 border-transparent border-t-gray-800/95`}
        ></span>
      </span>
    </a>
  );
};

export { FooterPolicyLink };
