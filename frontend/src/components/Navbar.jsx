const Navbar = () => {
    return <>

<div
  className="sticky"
  style={{
    background: "linear-gradient(to right, #833ab4, #fd1d1d, #fcb045)", // Instagram gradient
    color: "#ffffff", // White text
    padding: "4px 12px", // Compact padding
    fontWeight: "bold", // Bold font
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)", // Subtle shadow
  }}
>
  <h1
    className="text-center"
    style={{
      border: "2px solid #ffffff", // White border for contrast
      borderRadius: "12px", // Smoothly rounded corners
      width: "56px", // Adjusted width for a better ratio
      height: "40px", // Adjusted height
      lineHeight: "40px", // Vertically centered text
      textAlign: "center", // Centered text alignment
      fontFamily: "Arial, sans-serif", // Clean font style
    }}
  >
    ALICE
  </h1>
</div>


    </>
}

export default Navbar;