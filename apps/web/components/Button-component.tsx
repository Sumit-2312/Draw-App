"use client";

// TypeScript types for the props
interface ButtonProps {
  onClick: () => void; // onClick should be a function that returns nothing
  variant: "variant1" | "variant2"; // Only allow variant1 or variant2
  text: string; // Text for the button
}

export default function Button({ onClick, variant, text }: ButtonProps) {
  // Define button styles for different variants
  const buttonStyle = {
    variant1: {
      backgroundColor: "green",
      color: "white",
      fontWeight: "bold",
      padding: "10px 10px 10px 3px",
      height: "100%",
      border: "none",
    },
    variant2: {
      backgroundColor: "black",
      color: "white",
      padding: "10px 10px 10px 3px",
      height: "100%",
      border: "none",
    },
  };

  // Render the button with styles and text
  return (
    <button onClick={onClick} style={buttonStyle[variant]}>
      {text}
    </button>
  );
}
