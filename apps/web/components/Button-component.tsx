"use client";

import Link from "next/link";

export default function Button({ variant, text, href }) {
  const buttonStyle = {
    "variant1": {
      backgroundColor: "green",
      color: "white",
      fontWeight: "bold",
      padding: "10px 10px 10px 3px",
      height: "100%",
      border: "none",
    },
    "variant2": {
      backgroundColor: "black",
      color: "white",
      padding: "10px 10px 10px 3px",
      height: "100%",
      border: "none",
    },
  };

  return (
    <Link href={href}>
      <button style={buttonStyle[variant]}>
        {text}
      </button>
    </Link>
  );
}
