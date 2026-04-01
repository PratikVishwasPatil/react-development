import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, Tabs, Tab, Row, Col } from "react-bootstrap";

const FileSplitDetails = () => {
  const { id } = useParams();

  // Tab 1 – File Split
  const [files, setFiles] = useState([]);
  // Tab 2 – Assign to Design
  const [designFiles, setDesignFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("fileSplit");

  // Fetch File Split data
  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const res = await fetch(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/project/getSavedFileSplit.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: id }),
          }
        );
        const result = await res.json();
        if (result.status === "success") {
          setFiles(result.files);
        } else {
          setFiles([]);
        }
      } catch (err) {
        console.error(err);
        setFiles([]);
      }
    };
    fetchFileData();
  }, [id]);
  // Fetch Design Files
  // useEffect(() => {
  //   const fetchDesignFiles = async () => {
  //     try {
  //       const res = await fetch(
  //         "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/project/getSavedFileSplit.php",
  //       );
  //       const data = await res.json();
  //       setDesignFiles(data || []);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   fetchDesignFiles();
  // }, [id]);

  useEffect(() => {
    const fetchDesignFiles = async () => {
      try {
        const res = await fetch(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/project/getSavedFileSplit.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: id }),
          }
        );
        const result = await res.json();
        if (result.status === "success") {
          setDesignFiles(result.files);
        } else {
          setDesignFiles([]);
        }
      } catch (err) {
        console.error(err);
        setFiles([]);
      }
    };
    fetchDesignFiles();
  }, [id]);

  // Add Root File
  // const addRootFile = () => {
  //   const name = prompt("Enter Root File Name:");
  //   if (!name) return;
  //   setFiles((prev) => [
  //     ...prev,
  //     { FILE_ID: Date.now(), FILE_NAME: name, children: [], level: 0 },
  //   ]);
  // };

  // Add Split File
  const addSplitFile = (parentId) => {
    const name = prompt("Enter Split File Name:");
    if (!name) return;

    const addChild = (fileList) =>
      fileList.map((file) =>
        file.FILE_ID === parentId
          ? {
              ...file,
              children: [
                ...file.children,
                {
                  FILE_ID: Date.now(),
                  FILE_NAME: name,
                  children: [],
                  level: file.level + 1,
                  parentId: file.FILE_ID,
                },
              ],
            }
          : { ...file, children: addChild(file.children) }
      );

    setFiles((prev) => addChild(prev));
  };

  // Update File Name
  const updateFileName = (fileId, newName) => {
    const update = (fileList) =>
      fileList.map((file) =>
        file.FILE_ID === fileId
          ? { ...file, FILE_NAME: newName }
          : { ...file, children: update(file.children) }
      );
    setFiles((prev) => update(prev));
  };

  // Recursive Render for Tab 1
  const renderFiles = (fileList, level = 0) =>
    fileList.map((file) => (
      <Row
        key={file.FILE_ID}
        className="align-items-center mb-2"
        style={{ marginLeft: `${level * 30}px` }}
      >
        <Col xs="auto">
          <Form.Control
            type="text"
            value={file.FILE_NAME}
            onChange={(e) => updateFileName(file.FILE_ID, e.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            size="sm"
            onClick={() => addSplitFile(file.FILE_ID)}
          >
            Split
          </Button>
        </Col>
        {file.children && file.children.length > 0 && renderFiles(file.children, level + 1)}
      </Row>
    ));

  // Save Tab 1 Files
  const handleSaveFiles = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("No files to save");

    const splitName = [];
    const splitFileId = [];

    const flattenFiles = (fileList) => {
      fileList.forEach((file) => {
        splitName.push(file.FILE_NAME);
        splitFileId.push(file.parentId || 0);
        if (file.children && file.children.length > 0) flattenFiles(file.children);
      });
    };

    flattenFiles(files);

    const formData = new FormData();
    formData.append("save", true);
    formData.append("projectid", id);
    splitName.forEach((name) => formData.append("splitName[]", name));
    splitFileId.forEach((fid) => formData.append("splitFileId[]", fid));

    try {
      const res = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/project/saveFileSplitAjax.php", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      alert(result.message);
    } catch (err) {
      console.error(err);
      alert("Error saving files");
    }
  };

  // Recursive Tree for Tab 2
  const TreeNode = ({ node, onToggle, level = 0 }) => (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <span>
        {node.FILE_NAME}{" "}
        <input
          type="checkbox"
          checked={node.split_file_design_status === 1}
          onChange={() => onToggle(node.FILE_ID)}
        />
      </span>
      {node.children &&
        node.children.length > 0 &&
        node.children.map((child) => (
          <TreeNode key={child.FILE_ID} node={child} onToggle={onToggle} level={level + 1} />
        ))}
    </div>
  );

  const handleToggleDesign = (fileId) => {
    const toggleNode = (nodes) =>
      nodes.map((node) => {
        if (node.FILE_ID === fileId) {
          return { ...node, split_file_design_status: node.split_file_design_status === 1 ? 0 : 1 };
        }
        if (node.children) node.children = toggleNode(node.children);
        return node;
      });

    setDesignFiles((prev) => toggleNode(prev));

    // Optional: Update backend immediately
    fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/project/saveFileSplitAjax.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, projectId: id }),
    });
  };

  return (
    <div className="p-3">
      <h4 className="mb-3">File Split Details - ID: {id}</h4>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        {/* Tab 1 */}
        <Tab eventKey="fileSplit" title="File Split">
         
          <Form onSubmit={handleSaveFiles}>
            {files.length > 0 ? renderFiles(files) : <p>No files found.</p>}
            <div className="mt-3">
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </Form>
        </Tab>

        {/* Tab 2 */}
        <Tab eventKey="assign" title="Assign to Design">
          {designFiles.length === 0 ? (
            <p>No files found.</p>
          ) : (
            designFiles.map((file) => (
              <TreeNode key={file.FILE_ID} node={file} onToggle={handleToggleDesign} />
            ))
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default FileSplitDetails;
