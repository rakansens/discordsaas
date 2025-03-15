/**
 * Custom hook for bot management
 * Created: 2025/3/13
 */

import { useState, useEffect, useCallback } from "react";
import { BotWithoutToken, BotStatus, CreateBotRequest, UpdateBotRequest } from "@/types/bot";
import {
  getAllBots,
  getBotById,
  createBot,
  updateBot,
  deleteBot,
  updateBotStatus,
  getBotStatus,
} from "@/lib/api";

interface UseBotsReturn {
  bots: BotWithoutToken[];
  loading: boolean;
  error: Error | null;
  selectedBot: BotWithoutToken | null;
  fetchBots: () => Promise<void>;
  fetchBotById: (id: string) => Promise<void>;
  addBot: (bot: CreateBotRequest) => Promise<BotWithoutToken>;
  editBot: (bot: UpdateBotRequest) => Promise<BotWithoutToken>;
  removeBot: (id: string) => Promise<boolean>;
  changeBotStatus: (botId: string, status: BotStatus) => Promise<BotWithoutToken>;
}

/**
 * Custom hook for managing bots
 */
export function useBots(): UseBotsReturn {
  const [bots, setBots] = useState<BotWithoutToken[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotWithoutToken | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all bots
   */
  const fetchBots = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAllBots();
      setBots(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch bots"));
      console.error("Error fetching bots:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a bot by ID
   */
  const fetchBotById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getBotById(id);
      setSelectedBot(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch bot with ID ${id}`));
      console.error(`Error fetching bot with ID ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new bot
   */
  const addBot = useCallback(async (bot: CreateBotRequest): Promise<BotWithoutToken> => {
    setLoading(true);
    setError(null);
    
    try {
      const newBot = await createBot(bot);
      setBots((prevBots) => [...prevBots, newBot]);
      return newBot;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create bot");
      setError(error);
      console.error("Error creating bot:", err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Edit an existing bot
   */
  const editBot = useCallback(async (bot: UpdateBotRequest): Promise<BotWithoutToken> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedBot = await updateBot(bot);
      setBots((prevBots) =>
        prevBots.map((b) => (b.id === updatedBot.id ? updatedBot : b))
      );
      
      if (selectedBot && selectedBot.id === updatedBot.id) {
        setSelectedBot(updatedBot);
      }
      
      return updatedBot;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update bot with ID ${bot.id}`);
      setError(error);
      console.error(`Error updating bot with ID ${bot.id}:`, err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedBot]);

  /**
   * Remove a bot
   */
  const removeBot = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteBot(id);
      
      if (result.success) {
        setBots((prevBots) => prevBots.filter((b) => b.id !== id));
        
        if (selectedBot && selectedBot.id === id) {
          setSelectedBot(null);
        }
      }
      
      return result.success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to delete bot with ID ${id}`);
      setError(error);
      console.error(`Error deleting bot with ID ${id}:`, err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedBot]);

  /**
   * Change bot status
   */
  const changeBotStatus = useCallback(
    async (botId: string, status: BotStatus): Promise<BotWithoutToken> => {
      setLoading(true);
      setError(null);
      
      try {
        const updatedBot = await updateBotStatus(botId, status);
        setBots((prevBots) =>
          prevBots.map((b) => (b.id === botId ? { ...b, status } : b))
        );
        
        if (selectedBot && selectedBot.id === botId) {
          setSelectedBot({ ...selectedBot, status });
        }
        
        return updatedBot;
      } catch (err) {
        const error = err instanceof Error
          ? err
          : new Error(`Failed to update status for bot with ID ${botId}`);
        setError(error);
        console.error(`Error updating status for bot with ID ${botId}:`, err);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [selectedBot]
  );

  // Load bots on initial render
  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  return {
    bots,
    loading,
    error,
    selectedBot,
    fetchBots,
    fetchBotById,
    addBot,
    editBot,
    removeBot,
    changeBotStatus,
  };
}
