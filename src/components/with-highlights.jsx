// Renders text with its **…** parts in bold gold. On white the theme's dark
// gold (#9B7930) is used, since the light brand gold is hard to read there;
// on navy pass the brand gold instead.
export const withHighlights = (text, colorClass = "text-[#9B7930]") =>
  text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={`!font-bold ${colorClass}`}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
