// import React from "react";
// import { Modal, Button } from "react-bootstrap";

// export default function CommonAlertModal({
//   show,
//   onClose,
//   title = "Message",
//   message = "",
//   variant = "success", // success | danger | warning | info
// }) {
//   return (
//     <Modal show={show} onHide={onClose} centered backdrop="static">
//       <Modal.Header closeButton>
//         <Modal.Title>{title}</Modal.Title>
//       </Modal.Header>

//       <Modal.Body className="text-center">
//         <p className="mb-0">{message}</p>
//       </Modal.Body>

//       <Modal.Footer className="justify-content-center">
//         <Button variant={variant} onClick={onClose}>
//           OK
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// }

import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function CommonAlertModal({
  show,
  onClose,
  title = "Message",
  message = "",
  variant = "primary",

  // NEW (optional)
  type = "alert", // alert | confirm | generate
  onConfirm,
  onGenerate,
  companies = [],
}) {
  const [selectedCompany, setSelectedCompany] = React.useState("");

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {type === "alert" && <p>{message}</p>}

        {type === "confirm" && <p>{message}</p>}

        {type === "generate" && (
          <Form.Group>
            <Form.Label>Select Company</Form.Label>
            <Form.Select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Select</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-center">
        {/* ALERT */}
        {type === "alert" && (
          <Button variant={variant} onClick={onClose}>
            OK
          </Button>
        )}

        {/* CONFIRM */}
        {type === "confirm" && (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant={variant} onClick={onConfirm}>
              Confirm
            </Button>
          </>
        )}

        {/* GENERATE */}
        {type === "generate" && (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedCompany}
              onClick={() => onGenerate(selectedCompany)}
            >
              Generate
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
