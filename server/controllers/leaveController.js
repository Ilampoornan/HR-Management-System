// leaveController.js
const jwt = require('jsonwebtoken');
const leaveModel = require('../models/leaveModle');
const secretKey = '1234';

const leaveController = {
    getEmployeeLeaves: async (req, res) => {
        try {
            const token = req.cookies['user'];
            if (!token) return res.status(401).json({ message: "No token found" });

            const verified = jwt.verify(token, secretKey);
            if (!verified) return res.status(403).json({ message: "Invalid token" });

            const employeeLeaves = await leaveModel.getAllEmployeeLeaves();

            if (!employeeLeaves || employeeLeaves.length === 0) {
                return res.status(404).json({ message: 'No leave records found' });
            }
            const processedLeaves = employeeLeaves.map(leave => {
                const startDate = new Date(leave.start_date);
                const endDate = new Date(leave.end_date);
                const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

                return {
                    leave_id: leave.leave_id,
                    start_date: leave.start_date,
                    end_date: leave.end_date,
                    type_name: leave.type_name,
                    request_status: leave.request_status,
                    name: `${leave.first_name} ${leave.last_name}`,
                    job_title: leave.name,
                    duration: `${duration} days`
                };
            });

            res.status(200).json(processedLeaves);
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Invalid token or error fetching data' });
        }
    },

    updateLeaveStatus: async (req, res) => {
        try {
            const token = req.cookies['user'];
            if (!token) return res.status(401).json({ message: "No token found" });

            const verified = jwt.verify(token, secretKey);
            if (!verified) return res.status(403).json({ message: "Invalid token" });

            const { leave_id, status } = req.body;
            await leaveModel.updateLeaveStatus(leave_id, status);

            res.status(200).json({ message: 'Leave status updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Invalid token or error updating leave status' });
        }
    },

    addLeaveRequest: async (req, res) => {
        try {
            const token = req.cookies['user'];
            if (!token) return res.status(401).json({ message: 'No token found' });

            const verified = jwt.verify(token, secretKey);
            const { start_date, end_date, leave_type, description } = req.body;
            const employee_id = verified.employee_id;

            await leaveModel.addLeaveRequest(employee_id, start_date, end_date, leave_type, description);

            res.status(201).json({ message: 'Leave request added successfully' });
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Invalid token or error adding leave request' });
        }
    },

    getLeaveTypes: async (req, res) => {
        try {
            const token = req.cookies['user'];
            const leaveTypes = await leaveModel.getLeaveTypes(token);
            res.status(200).json(leaveTypes);
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Error fetching leave types' });
        }
    },

    getAllLeaveTypes: async (req, res) => {
        console.log('Controller: getAllLeaveTypes called'); // Debug log
        try {
          const leaveTypes = await leaveModel.getAllLeaveTypes();
          console.log('Controller: Leave Types fetched:', leaveTypes); // Log fetched data
          res.status(200).json(leaveTypes);
        } catch (err) {
          console.error('Controller: Error fetching leave types:', err);
          res.status(400).json({ error: 'Error fetching leave types' });
        }
    },

    editAllLeaveTypes: async (req, res) => {
        try {
          const updatedLeaveTypes = req.body; // Get updated leave types from request body
          const result = await leaveModel.editAllLeaveTypes(updatedLeaveTypes); // Update the leave types
          res.status(200).json(result); // Return success message
        } catch (err) {
          console.error('Error updating leave types:', err);
          res.status(400).json({ error: 'Error updating leave types' }); // Return error if any issue occurs
        }
    },

    getLeaveRequestOfUser: async (req, res) => {
        try {
            const token = req.cookies['user'];
            if (!token) return res.status(401).json({ message: 'No token found' });

            const verified = jwt.verify(token, secretKey);
            const employee_id = verified.employee_id;

            const leaveRequests = await leaveModel.getLeaveRequestsByEmployeeId(employee_id);

            const processedLeaves = leaveRequests.map(leave => {
                const startDate = new Date(leave.start_date);
                const endDate = new Date(leave.end_date);
                const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)+1);

                return {
                    leave_id: leave.leave_id,
                    start_date: leave.start_date,
                    end_date: leave.end_date,
                    type_name: leave.type_name,
                    request_status: leave.request_status,
                    duration: `${duration} days`
                };
            });

            res.status(200).json(processedLeaves);
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Error fetching leave requests' });
        }
    },

    getLeaveCountDetails: async (req, res) => {
        try {
            const token = req.cookies['user'];
            if (!token) return res.status(401).json({ message: 'No token found' });

            const verified = jwt.verify(token, secretKey);
            const employee_id = verified.employee_id;
          
            const leaveCountDetails = await leaveModel.getLeaveCountDetails(employee_id);
            // Send the leave count details in the response
            res.status(200).json(leaveCountDetails);
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Error fetching leave count details' });
        }
    }

    
    

};

module.exports = leaveController;

