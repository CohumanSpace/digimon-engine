#!/usr/bin/env node
import { Command } from "commander";
import {
  createAgent,
  modifyAgent,
  listAgents,
  setupEnvironment,
} from "./agentCommands";

const program = new Command();

program
  .name("ai-cli")
  .description("CLI tool for managing AI agents")
  .version("1.0.0");

program.command("agent").description("Agent management commands");

program
  .command("agent create")
  .description("Create a new agent with specified configuration")
  .requiredOption("-n, --name <name>", "name of the agent")
  .option("-m, --model <model>", "model to use", "gpt-3.5-turbo")
  .option("-d, --description <description>", "agent description")
  .option("-s, --system-prompt <prompt>", "system prompt for the agent")
  .action(async (options) => {
    await createAgent(options);
  });

program
  .command("agent modify")
  .description("Modify an existing agent's configuration")
  .requiredOption("-i, --agent-id <id>", "ID of the agent to modify")
  .option("-n, --name <name>", "new name for the agent")
  .option("-m, --model <model>", "new model to use")
  .option("-d, --description <description>", "new agent description")
  .option("-s, --system-prompt <prompt>", "new system prompt")
  .action(async (options) => {
    await modifyAgent(options);
  });

program
  .command("agent list")
  .description("List all available agents")
  .action(async () => {
    await listAgents();
  });

program
  .command("agent setup-env")
  .description("Setup the environment for agents")
  .argument("<env-name>", "name of the environment")
  .option("-c, --config-file <path>", "path to config file")
  .action(async (envName, options) => {
    await setupEnvironment(envName, options.configFile);
  });

program.parse();
