const SEARCHABLE_KEYS = Symbol('searchableKeys');
import 'reflect-metadata';

export function Searchable(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existing = Reflect.getMetadata(SEARCHABLE_KEYS, target) || [];
    Reflect.defineMetadata(SEARCHABLE_KEYS, [...existing, propertyKey], target);
  };
}

export function getSearchableKeys(obj: any): string[] {
  return Reflect.getMetadata(SEARCHABLE_KEYS, obj) || [];
}