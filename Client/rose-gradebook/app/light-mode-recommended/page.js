export default function Home() 
{
  const divStyle = {
    backgroundColor: 'black', // Always black, regardless of light/dark mode
    color: 'white', // Optional: white text for contrast
    height: '100vh', // Full viewport height for demonstration
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div style={divStyle}>
      Light mode is recommended for this site :)
    </div>
  );
};