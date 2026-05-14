import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import Config from '../../config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { data } = req.body;
      const response = await axios.post(`${Config.BaseUrl}/login`, { data });
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  } else if (req.method === "PATCH" || req.method === "PUT") {
    try {
      const { firstName, lastName, email, phone, password } = req.body;
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const response = await axios.put(
        `${Config.BaseUrl}/booking-engine/customer/me`,
        { firstName, lastName, email, phone, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      res.status(200).json({ data: response.data.data });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  } else {
    res.setHeader("Allow", ["POST", "PATCH", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
