/**
 * Custom hook for command management
 * Created: 2025/3/13
 */

import { useState, useEffect, useCallback } from "react";
import { CommandWithPrompt, CreateCommandRequest, UpdateCommandRequest } from "@/types/command";
import {
  getAllCommands,
  getCommandsByBotId,
  getCommandById,
  createCommand,
  updateCommand,
  deleteCommand,
} from "@/lib/api";

interface UseCommandsReturn {
  commands: CommandWithPrompt[];
  loading: boolean;
  error: Error | null;
  selectedCommand: CommandWithPrompt | null;
  fetchCommands: () => Promise<void>;
  fetchCommandsByBotId: (botId: string) => Promise<void>;
  fetchCommandById: (id: string) => Promise<void>;
  addCommand: (command: CreateCommandRequest) => Promise<CommandWithPrompt>;
  editCommand: (command: UpdateCommandRequest) => Promise<CommandWithPrompt>;
  removeCommand: (id: string) => Promise<boolean>;
}

/**
 * Custom hook for managing commands
 */
export function useCommands(): UseCommandsReturn {
  const [commands, setCommands] = useState<CommandWithPrompt[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<CommandWithPrompt | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all commands
   */
  const fetchCommands = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAllCommands();
      setCommands(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch commands"));
      console.error("Error fetching commands:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch commands by bot ID
   */
  const fetchCommandsByBotId = useCallback(async (botId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCommandsByBotId(botId);
      setCommands(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch commands for bot with ID ${botId}`));
      console.error(`Error fetching commands for bot with ID ${botId}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a command by ID
   */
  const fetchCommandById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCommandById(id);
      setSelectedCommand(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch command with ID ${id}`));
      console.error(`Error fetching command with ID ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new command
   */
  const addCommand = useCallback(async (command: CreateCommandRequest): Promise<CommandWithPrompt> => {
    setLoading(true);
    setError(null);
    
    try {
      const newCommand = await createCommand(command);
      setCommands((prevCommands) => [...prevCommands, newCommand]);
      return newCommand;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create command");
      setError(error);
      console.error("Error creating command:", err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Edit an existing command
   */
  const editCommand = useCallback(async (command: UpdateCommandRequest): Promise<CommandWithPrompt> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCommand = await updateCommand(command);
      setCommands((prevCommands) =>
        prevCommands.map((c) => (c.id === updatedCommand.id ? updatedCommand : c))
      );
      
      if (selectedCommand && selectedCommand.id === updatedCommand.id) {
        setSelectedCommand(updatedCommand);
      }
      
      return updatedCommand;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update command with ID ${command.id}`);
      setError(error);
      console.error(`Error updating command with ID ${command.id}:`, err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedCommand]);

  /**
   * Remove a command
   */
  const removeCommand = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteCommand(id);
      
      if (result.success) {
        setCommands((prevCommands) => prevCommands.filter((c) => c.id !== id));
        
        if (selectedCommand && selectedCommand.id === id) {
          setSelectedCommand(null);
        }
      }
      
      return result.success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to delete command with ID ${id}`);
      setError(error);
      console.error(`Error deleting command with ID ${id}:`, err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedCommand]);

  // Load commands on initial render
  useEffect(() => {
    fetchCommands();
  }, [fetchCommands]);

  return {
    commands,
    loading,
    error,
    selectedCommand,
    fetchCommands,
    fetchCommandsByBotId,
    fetchCommandById,
    addCommand,
    editCommand,
    removeCommand,
  };
}
