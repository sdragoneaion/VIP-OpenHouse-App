import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function MoreInfo({ userKey, signupid: propSignupId }) {
  const [detailedData, setDetailedData] = useState([]);
  const { signupid: routeSignupId } = useParams();
  const signupid = propSignupId || routeSignupId;

  useEffect(() => {
    const baseUrl = `https://api.signupgenius.com/v2/k/signups/report/filled/${signupid}/?user_key=${userKey}`;

    fetch(baseUrl, {
      headers: {
        Accept: "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.data && data.data.signup) {
          setDetailedData(data.data.signup);
        } else {
          setDetailedData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [userKey, signupid]);

  return (
    <div>
      <h2>Detailed Information for Sign-up ID: {signupid}</h2>
      {detailedData.length > 0 ? (
        <ul>
          {detailedData.map((signup) => (
            <li key={signup.itemmemberid}>
              <h3>
                {signup.firstname} {signup.lastname}
              </h3>
              <p>
                Start Time: {new Date(signup.startdate * 1000).toUTCString()}
              </p>
              <p>End Time: {new Date(signup.enddate * 1000).toUTCString()}</p>
              <p>Phone: {signup.phone}</p>
              <p>Email: {signup.email}</p>
              <p>Unit Type: {signup.comment}</p>
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading detailed information...</p>
      )}
    </div>
  );
}

export default MoreInfo;
