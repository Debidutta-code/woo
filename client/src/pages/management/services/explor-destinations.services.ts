import type { ICExplorDestination } from "../types";
import {
  createExplorDestination,
  getExplorDestinations,
  updateExplorDestination,
  deleteExplorDestination,
} from "../api/explor-destinations.api";

export const createExplorDestinationService = async (
  data: ICExplorDestination,
) => {
  try {
    const response = await createExplorDestination(data);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Error occur while creating destination",
    };
  }
};

export const getExplorDestinationsService = async () => {
  try {
    const response = await getExplorDestinations();
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Error occur while fetching destination",
    };
  }
};

export const updateExplorDestinationService = async (
  id: string,
  data: ICExplorDestination,
) => {
  try {
    const response = await updateExplorDestination(id, data);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Error occur while updating destination",
    };
  }
};
export const deleteExplorDestinationService = async (id: string) => {
  try {
    const response = await deleteExplorDestination(id);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Error occur while deleting destination",
    };
  }
};
