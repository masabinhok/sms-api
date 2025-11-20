/**
 * Simple logger utility for seed scripts and CLI tools
 * Provides consistent formatting for seed operations
 */
export class SeedLogger {
  static log(message: string): void {
    console.log(message);
  }

  static success(message: string): void {
    console.log(`✅ ${message}`);
  }

  static error(message: string, error?: any): void {
    console.error(`❌ ${message}`, error || '');
  }

  static info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  static section(message: string): void {
    console.log(`\n${message}`);
  }

  static detail(message: string): void {
    console.log(`   ${message}`);
  }
}
