import Spinner from 'react-bootstrap/Spinner';

function GrowSpinner2() {
  // return <Spinner animation="grow" />;
  
  return(
    <div className="fixed inset-0 flex items-center justify-center z-50">
  <div className="bg-black bg-opacity-50 p-4 rounded-lg">
    <Spinner animation="grow" />
    <span className="ml-2 text-white">Loading...</span>
  </div>
</div>
  )
}

export default GrowSpinner2;