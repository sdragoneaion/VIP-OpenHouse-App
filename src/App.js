import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Modal from "react-modal";
import { Card, Container, Row, Col, Button, Form } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import jsonexport from "jsonexport"; // import the jsonexport library

import "./App.css";

Modal.setAppElement("#root");

function MoreInfo({ userKey, signupid: propSignupId, onDetailedDataChange }) {
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
          // Pass the detailed data back to the App component
          onDetailedDataChange(data.data.signup);
        } else {
          setDetailedData([]);
          // Pass an empty array back to the App component
          onDetailedDataChange([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [userKey, signupid, onDetailedDataChange]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>
          Open House Signups for:{" "}
          <strong>{detailedData[0]?.location || "Loading location..."}</strong>
        </h3>
      </div>
      <br />
      {detailedData.length > 0 ? (
        <ul>
          {detailedData
            .sort((a, b) => b.startdate - a.startdate)
            .map((signup) => {
              const startDate = new Date(signup.startdate * 1000);
              return (
                <li key={signup.itemmemberid}>
                  <p>
                    {signup.firstname} {signup.lastname}
                  </p>
                  <p>Date: {startDate.toDateString()}</p>
                  <p>
                    Start Time:{" "}
                    {startDate.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    })}
                  </p>
                  <p>Phone: {signup.phone}</p>
                  <p>Email: {signup.email}</p>
                  <p>Unit Type: {signup.comment}</p>
                  <hr />
                </li>
              );
            })}
        </ul>
      ) : (
        <p>Loading detailed information...</p>
      )}
    </div>
  );
}

function App() {
  const [signupsData, setSignupsData] = useState([]);
  const [selectedSignupId, setSelectedSignupId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [detailedData, setDetailedData] = useState([]); // New state for detailed data
  const [isDetailedDataLoaded, setIsDetailedDataLoaded] = useState(false);

  useEffect(() => {
    const userKey = "M0NqbHFRSlFLa0FkN0R2cU5mckVXdz09";
    const baseUrl = "https://api.signupgenius.com/v2/k/";

    fetch(`${baseUrl}signups/created/active/?user_key=${userKey}`, {
      headers: {
        Accept: "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Response status:", response.status);
          console.error("Response text:", response.statusText);
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.data) {
          setSignupsData(data.data);
          setSelectedSignupId(data.data[0].signupid); // Initialize with the first signup id
        } else {
          setSignupsData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // We can set isDetailedDataLoaded to false when a new signup is selected
    setIsDetailedDataLoaded(false);
  }, [selectedSignupId]);

  const handleQuickLookClick = (signupid) => {
    setSelectedSignupId(signupid);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredSignups = signupsData.filter((signup) =>
    signup.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDetailedDataChange = (data) => {
    setDetailedData(data);
    setIsDetailedDataLoaded(true); // Set isDetailedDataLoaded to true when detailed data is loaded
  };

  const handleExportClick = () => {
    if (!isDetailedDataLoaded) {
      console.error("Detailed data not yet loaded. Please wait.");
      return;
    }

    if (detailedData.length === 0) {
      console.error("No signup detail to export.");
      return;
    }

    jsonexport(detailedData, function (err, csv) {
      if (err) return console.log(err);

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signup_${selectedSignupId}_detail.csv`; // Use selectedSignupId for the filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  return (
    <Router>
      <Container>
        <Row>
          <Col>
            <h1>AION Management VIP Open House Signups</h1>
          </Col>
          <br />
        </Row>
        <Row>
          <Col>
            <Form.Control
              type="text"
              placeholder="Search Signups"
              value={searchText}
              onChange={handleSearchChange}
            />
            <br />
          </Col>
        </Row>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Row className="d-flex">
                  {filteredSignups.length > 0 ? (
                    filteredSignups.map((signup) => (
                      <Col
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        className="mb-4 d-flex align-items-stretch"
                        key={signup.signupid}
                      >
                        <Card className="tile w-100">
                          <Card.Body className="d-flex flex-column justify-content-between">
                            <Card.Title>{signup.title}</Card.Title>
                            <br />
                            <div className="d-flex justify-content-between align-items-center">
                              <Button
                                variant="primary"
                                onClick={() =>
                                  handleQuickLookClick(signup.signupid)
                                }
                              >
                                Quick Look
                              </Button>
                              <Button
                                variant="success"
                                onClick={() =>
                                  handleExportClick(signup.signupid)
                                }
                              >
                                Export
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col>
                      <p>Loading signups data...</p>
                    </Col>
                  )}
                </Row>
                <Modal
                  isOpen={isModalOpen}
                  onRequestClose={handleCloseModal}
                  contentLabel="Signup Details"
                >
                  <button onClick={handleCloseModal}>Close</button>
                  <br />
                  <br />
                  {selectedSignupId && (
                    <MoreInfo
                      userKey="M0NqbHFRSlFLa0FkN0R2cU5mckVXdz09"
                      signupid={selectedSignupId}
                      onDetailedDataChange={handleDetailedDataChange} // Pass the callback function
                    />
                  )}
                </Modal>
              </>
            }
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
