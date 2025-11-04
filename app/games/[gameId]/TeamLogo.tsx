"use client";

type TeamLogoProps = {
  teamAbbr: string;
  size?: number;
};

export default function TeamLogo({ teamAbbr, size = 24 }: TeamLogoProps) {
  return (
    <img
      src={`/team-logos/${teamAbbr.toLowerCase()}.png`}
      alt={teamAbbr}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
      }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

