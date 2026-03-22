import { Order } from './types';

export class Node {
  constructor(
    public order: Order,
    public prev: Node | null = null,
    public next: Node | null = null,
  ) {}
}

export class DoublyLinkedList {
  private head: Node | null = null;
  private tail: Node | null = null;
  private _length: number = 0;

  get length() {
    return this._length;
  }

  append(order: Order): Node {
    const node = new Node(order);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail!.next = node;
      this.tail = node;
    }
    this._length++;
    return node;
  }

  remove(node: Node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    this._length--;
  }

  getHead(): Node | null {
    return this.head;
  }

  toArray(): Order[] {
    const arr: Order[] = [];
    let curr = this.head;
    while (curr) {
      arr.push(curr.order);
      curr = curr.next;
    }
    return arr;
  }
}
