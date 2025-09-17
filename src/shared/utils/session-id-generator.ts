export class SessionIdGenerator {
  private static readonly ID_LENGTH = 8;
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private static readonly MAX_ATTEMPTS = 10;

  static generateId(): string {
    const array = new Uint8Array(this.ID_LENGTH);
    crypto.getRandomValues(array);
    
    let result = '';
    for (let i = 0; i < this.ID_LENGTH; i++) {
      result += this.CHARACTERS[array[i] % this.CHARACTERS.length];
    }
    
    return result;
  }

  static async generateUniqueId(
    checkExists: (id: string) => Promise<boolean>
  ): Promise<string> {
    for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
      const id = this.generateId();
      
      try {
        const exists = await checkExists(id);
        if (!exists) {
          return id;
        }
      } catch (error) {
        console.warn(`Failed to check if session ID ${id} exists:`, error);
        // On error, assume ID is valid to avoid infinite loop
        return id;
      }
    }
    
    // Fallback: generate ID with timestamp
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    const randomPart = this.generateId().slice(0, 4);
    return randomPart + timestamp;
  }

  static validateId(id: string): boolean {
    if (!id || id.length !== this.ID_LENGTH) {
      return false;
    }
    
    return /^[A-Z0-9]+$/.test(id);
  }

  static formatId(input: string): string {
    return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, this.ID_LENGTH);
  }
}
