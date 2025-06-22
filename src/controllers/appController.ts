import { Request, Response } from 'express';
import { CalculatorService } from '../services/calculatorService.js';
import { GitHubService } from '../services/githubService.js';
import { BaseSuccessResponseDto, BaseErrorResponseDto } from '../types/agent.js';
import { SplitwiseService } from '@/services/splitwiseService.js';
import { CashfreeService } from '@/services/cashfreeService.js';

/**
 * App Controller
 * Handles both calculator tools (public, no auth) and GitHub tools (authenticated)
 * Demonstrates mixed authentication patterns for educational purposes
 */
export class AppController {
  private calculatorService: CalculatorService;
  private githubService: GitHubService;
  private splitwiseService: SplitwiseService;
  private cashFreeService: CashfreeService;

  constructor() {
    this.calculatorService = new CalculatorService();
    this.githubService = new GitHubService();
    this.splitwiseService = new SplitwiseService();
    this.cashFreeService = new CashfreeService();
  }

  /**
   * Handle tool execution - routes to appropriate handler based on tool type
   */
  async handleTool(req: Request, res: Response): Promise<void> {
    const { toolName } = req.params;
    const params = req.body;

    try {
      // Handle Calculator Tools (No Auth Required)
      if (this.isCalculatorTool(toolName)) {
        await this.handleCalculatorTool(toolName, params, res);
        return;
      }

      // Handle GitHub Tools (Auth Required)
      if (this.isGitHubTool(toolName)) {
        const token = this.extractBearerToken(req);
        if (!token) {
          const errorResponse = new BaseErrorResponseDto(
            'GitHub tools require authentication. Please provide a Bearer token.',
            401,
            'Missing Authorization header with Bearer token'
          );
          res.status(401).json(errorResponse);
          return;
        }
        await this.handleGitHubTool(toolName, params, token, res);
        return;
      }

      if (this.isUpiTool(toolName)) {
        const token = this.extractSplitwiseKey(req);
        if (!token) {
          const errorResponse = new BaseErrorResponseDto(
            'Splitwise tools require authentication. Please provide a key in the "x-splitwise-key" header.',
            401,
            'Missing x-splitwise-key header'
          );
          res.status(401).json(errorResponse);
          return;
        }
        await this.handleUpiTool(toolName, token, params, res);
        return;
      }

      if (this.isCashFreeTool(toolName)) {
        // const token = this.extractBearerToken(req);
        // if (!token) {
        //   const errorResponse = new BaseErrorResponseDto(
        //     'CashFree tools require authentication. Please provide a Bearer token.',
        //     401,
        //     'Missing Authorization header with Bearer token'
        //   );
        //   res.status(401).json(errorResponse);
        //   return;
        // }
        // Handle CashFree tool execution here
        const token = this.extractCashfreeToken(req);
        // console.log(req);
        await this.handleCashFreeTool(toolName, params, token, res);
        return;
      }

      if (this.isBhindiTool(toolName)) {
        // Handle Bhindi tool execution here
        // For example, getChat
        const token = this.extractBearerToken(req);
        if (!token) {
          const errorResponse = new BaseErrorResponseDto(
            'Bhindi tools require authentication. Please provide a Bearer token.',
            401,
            'Missing Authorization header with Bearer token'
          );
          res.status(401).json(errorResponse);
          return;
        }
        // Implement Bhindi tool handling logic here
        await this.handleBhindiTool(toolName, params, token, res);
        return;
      }

      // Unknown tool
      const errorResponse = new BaseErrorResponseDto(
        `Unknown tool: ${toolName}`,
        404,
        `Available tools: ${[...this.getCalculatorTools(), ...this.getGitHubTools()].join(', ')}`
      );
      res.status(404).json(errorResponse);
    } catch (error) {
      const errorResponse = new BaseErrorResponseDto(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'Tool execution failed'
      );
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Handle calculator tool execution
   */
  private async handleCalculatorTool(toolName: string, params: any, res: Response): Promise<void> {
    let result: number;
    let operation: string;

    switch (toolName) {
      case 'add':
        this.validateParameters(params, ['a', 'b']);
        result = this.calculatorService.add(params.a, params.b);
        operation = `${params.a} + ${params.b}`;
        break;
      
      case 'subtract':
        this.validateParameters(params, ['a', 'b']);
        result = this.calculatorService.subtract(params.a, params.b);
        operation = `${params.a} - ${params.b}`;
        break;
      
      case 'multiply':
        this.validateParameters(params, ['a', 'b']);
        result = this.calculatorService.multiply(params.a, params.b);
        operation = `${params.a} × ${params.b}`;
        break;
      
      case 'divide':
        this.validateParameters(params, ['a', 'b']);
        result = this.calculatorService.divide(params.a, params.b);
        operation = `${params.a} ÷ ${params.b}`;
        break;
      
      case 'power':
        this.validateParameters(params, ['base', 'exponent']);
        result = this.calculatorService.power(params.base, params.exponent);
        operation = `${params.base}^${params.exponent}`;
        break;
      
      case 'sqrt':
        this.validateParameters(params, ['number']);
        result = this.calculatorService.sqrt(params.number);
        operation = `√${params.number}`;
        break;
      
      case 'percentage':
        this.validateParameters(params, ['percentage', 'of']);
        result = this.calculatorService.percentage(params.percentage, params.of);
        operation = `${params.percentage}% of ${params.of}`;
        break;
      
      case 'factorial':
        this.validateParameters(params, ['number']);
        result = this.calculatorService.factorial(params.number);
        operation = `${params.number}!`;
        break;
      
      case 'countCharacter':
        this.validateCharacterCountParameters(params);
        result = this.calculatorService.countCharacter(params.character, params.text);
        operation = `Count '${params.character}' in "${params.text.length > 30 ? params.text.substring(0, 30) + '...' : params.text}"`;
        break;
      
      default:
        throw new Error(`Unknown calculator tool: ${toolName}`);
    }

    const response = new BaseSuccessResponseDto({
      operation,
      result,
      message: `Calculated ${operation} = ${result}`,
      tool_type: 'calculator'
    }, 'mixed');

    res.json(response);
  }

  /**
   * Handle GitHub tool execution
   */
  private async handleGitHubTool(toolName: string, params: any, token: string, res: Response): Promise<void> {
    switch (toolName) {
      case 'listUserRepositories':
        const repositories = await this.githubService.listUserRepositories(token, {
          per_page: params.per_page,
          sort: params.sort,
          direction: params.direction,
          type: params.type
        });

        const response = new BaseSuccessResponseDto({
          ...repositories,
          tool_type: 'github',
          authenticated: true
        }, 'mixed');

        res.json(response);
        break;
      
      default:
        throw new Error(`Unknown GitHub tool: ${toolName}`);
    }
  }

  private async handleUpiTool(toolName: string, token: string, params: any, res: Response): Promise<void> {
    let result: any;
    switch (toolName) {
      case 'getCurrentUser':
        console.log(token);
        result = await this.splitwiseService.getCurrentUser(token);
        break;
      case 'getUser':
        this.validateUpiNumberParams(params, ['id']);
        result = await this.splitwiseService.getUser(token, params.id);
        break;
      case 'getGroups':
        result = await this.splitwiseService.getGroups(token);
        break;
      case 'getGroup':
        this.validateUpiNumberParams(params, ['id']);
        result = await this.splitwiseService.getGroup(token, params.id);
        break;
      case 'createGroup':
        this.validateUpiStringParams(params, ['name']);
        result = await this.splitwiseService.createGroup(token, params);
        break;
      case 'deleteGroup':
        this.validateUpiNumberParams(params, ['id']);
        result = await this.splitwiseService.deleteGroup(token, params.id);
        break;
      case 'getFriends':
        result = await this.splitwiseService.getFriends(token);
        break;
      case 'getFriend':
        this.validateUpiNumberParams(params, ['id']);
        result = await this.splitwiseService.getFriend(token, params.id);
        break;
      case 'createFriend':
        this.validateUpiStringParams(params, ['user_email']);
        result = await this.splitwiseService.createFriend(token, params);
        break;
      case 'deleteFriend':
        this.validateUpiNumberParams(params, ['id']);
        result = await this.splitwiseService.deleteFriend(token, params.id);
        break;
      case 'getExpenses':
        result = await this.splitwiseService.getExpenses(token, params);
        break;
      case 'getExpense':
        this.validateUpiNumberParams(params, ['id']);
        result = await this.splitwiseService.getExpense(token, params.id);
        break;
      case 'createExpense':
        result = await this.splitwiseService.createExpense(token, params);
        break;
      case 'getComments':
        this.validateUpiNumberParams(params, ['expense_id']);
        result = await this.splitwiseService.getComments(token, params.expense_id);
        break;
      default:
        throw new Error(`Unknown UPI tool: ${toolName}`);
    }

    const response = new BaseSuccessResponseDto(
      {
        result,
        message: `Executed UPI tool: ${toolName}`,
        tool_type: 'upi'
      },
      'mixed'
    );

    res.json(response);
  }

  private async handleCashFreeTool(toolName: string, params: any, token:any, res: Response): Promise<void> {
    // Implement CashFree tool handling logic here
    // For example, creating a payment link
    switch (toolName) {
      case 'createPaymentLink':
        console.log(token);
        // this.validateUpiStringParams(params, ['amount', 'currency', 'customer_email', 'customer_phone']);
        const cashfreeToken = token;
        if (!cashfreeToken) {
          const errorResponse = new BaseErrorResponseDto(
            'CashFree tools require x-api-version, x-client-id, and x-client-secret headers.',
            401,
            'Missing CashFree API credentials in headers'
          );
          res.status(401).json(errorResponse);
          return;
        }
        const response = await this.cashFreeService.createPaymentLink(cashfreeToken, params);
        // console.log(response);
        res.status(200).json({
          success: true,
          message: 'Payment link created successfully',
          data: response,
          tool_type: 'cashfree'
        });
        break;
      default:
        throw new Error(`Unknown CashFree tool: ${toolName}`);
    }
  }

  private async handleBhindiTool(toolName: string, params: any, token: string, res: Response): Promise<void> {
    switch (toolName) {
      case 'getChat': {
        try {
          const API_URL = 'https://client-api.bhindi.io/api/chats';
          const headers = {
            'Authorization': `Bearer ${token}`,
          };

          // Get chats
          const chatResponse = await fetch(API_URL, { headers });
          const data = await chatResponse.json();
          const firstChatId = data?.data?.chats?.[0]?.chatId;

          if (!firstChatId) {
            res.status(404).json({ error: 'No chats found' });
            return;
          }

          // Get messages for the first chat
          const messagesUrl = `https://client-api.bhindi.io/api/chat/${firstChatId}/messages`;
          const messagesResponse = await fetch(messagesUrl, { headers });
          const messagesData = await messagesResponse.json();

          // Extract messages and filter by role
          const messages = messagesData?.data?.messages || [];
          
          // Find the most recent user and assistant messages
          const userMessages = messages.filter((msg: any) => msg.role === 'user');
          const assistantMessages = messages.filter((msg: any) => msg.role === 'assistant');
          
          const latestUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
          const latestAssistantMessage = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null;
          
          const recentMessages = {
            user: latestUserMessage,
            assistant: latestAssistantMessage
          };
          
          res.status(messagesResponse.status).json(recentMessages);
        } catch (e: any) {
          res.status(500).json({ error: e.message || 'Failed to fetch Bhindi chat/messages' });
        }
        break;
      }
      default:
        throw new Error(`Unknown Bhindi tool: ${toolName}`);
    }
  }

  /**
   * Validate required parameters
   */
  private validateParameters(params: any, required: string[]): void {
    for (const param of required) {
      if (params[param] === undefined || params[param] === null) {
        throw new Error(`Missing required parameter: ${param}`);
      }
      if (typeof params[param] !== 'number') {
        throw new Error(`Parameter '${param}' must be a number`);
      }
    }
  }

  /**
   * Validate parameters for character count tool
   */
  private validateCharacterCountParameters(params: any): void {
    if (params.character === undefined || params.character === null) {
      throw new Error('Missing required parameter: character');
    }
    if (params.text === undefined || params.text === null) {
      throw new Error('Missing required parameter: text');
    }
    if (typeof params.character !== 'string') {
      throw new Error("Parameter 'character' must be a string");
    }
    if (typeof params.text !== 'string') {
      throw new Error("Parameter 'text' must be a string");
    }
    if (params.character.length !== 1) {
      throw new Error('Character parameter must be exactly one character');
    }
  }

  /**
   * Validate required UPI parameters that should be numbers
   */
  private validateUpiNumberParams(params: any, required: string[]): void {
    for (const param of required) {
      if (params[param] === undefined || params[param] === null) {
        throw new Error(`Missing required parameter: ${param}`);
      }
      if (typeof params[param] !== 'number') {
        throw new Error(`Parameter '${param}' must be a number`);
      }
    }
  }

  /**
   * Validate required UPI parameters that should be strings
   */
  private validateUpiStringParams(params: any, required: string[]): void {
    for (const param of required) {
      if (params[param] === undefined || params[param] === null) {
        throw new Error(`Missing required parameter: ${param}`);
      }
      if (typeof params[param] !== 'string') {
        throw new Error(`Parameter '${param}' must be a string`);
      }
    }
  }

  /**
   * Extract Bearer token from request
   */
  private extractBearerToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  /**
   * Extract Splitwise API key from request
   */
  private extractSplitwiseKey(req: Request): string | null {
    console.log(req.headers)
    const key = req.headers['x-splitwise-key'];
    console.log(key);
    if (key && typeof key === 'string') {
      return key;
    }
    return null;
  }

  /**
   * Extract Cashfree token from request
   */
  private extractCashfreeToken(req: Request): { xApiVersion: string, apiKey: string, apiSecret: string } | null {
    const xApiVersion = req.headers['x-api-version'];
    const apiKey = req.headers['x-client-id'];
    const apiSecret = req.headers['x-client-secret'];
    if (
      typeof xApiVersion === 'string' &&
      typeof apiKey === 'string' &&
      typeof apiSecret === 'string'
    ) {
      return {
        xApiVersion,
        apiKey,
        apiSecret
      };
    }
    return null;
  }

  /**
   * Check if tool is a calculator tool
   */
  private isCalculatorTool(toolName: string): boolean {
    return this.getCalculatorTools().includes(toolName);
  }

  /**
   * Check if tool is a GitHub tool
   */
  private isGitHubTool(toolName: string): boolean {
    return this.getGitHubTools().includes(toolName);
  }

  private isUpiTool(toolName: string): boolean{
    return this.getUpiTools().includes(toolName);
  }

  private isCashFreeTool(toolName: string): boolean {
    return this.cashFreeTools().includes(toolName);
  }

  private isBhindiTool(toolName: string): boolean {
    return this.bhindiTools().includes(toolName);
  }

  /**
   * Get list of calculator tools
   */
  private getCalculatorTools(): string[] {
    return ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'percentage', 'factorial', 'countCharacter'];
  }

  /**
   * Get list of GitHub tools
   */
  private getGitHubTools(): string[] {
    return ['listUserRepositories'];
  }

  private getUpiTools(): string[] {
    return [
      'getCurrentUser',
      'getUser',
      'getGroups',
      'getGroup',
      'createGroup',
      'deleteGroup',
      'getFriends',
      'getFriend',
      'createFriend',
      'deleteFriend',
      'getExpenses',
      'getExpense',
      'createExpense',
      'getComments'
    ];
  }

  private cashFreeTools(): string[] {
    return [
      'createPaymentLink'
    ];
  }

  private bhindiTools(): string[] {
    return [
      'getChat'
    ];
  }
}