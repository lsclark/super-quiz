import { Injectable } from "@angular/core";
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";

export interface ModalSpec {
  component: unknown;
  identifier?: string | number;
  inputs: { [key: string]: unknown };
}

const DEFAULT_MODAL_OPTIONS: NgbModalOptions = {
  backdrop: "static",
};

@Injectable({
  providedIn: "root",
})
export class ModalControllerService {
  private stack: ModalSpec[];
  private topModal?: NgbModalRef;

  constructor(private modalService: NgbModal) {
    this.stack = [];
  }

  /**
   *
   * @param identifier If provided, any ModalSpecs on the stack with this identifier are removed
   */
  dismissTop(identifier: number | string | null = null): void {
    this.topModal?.close();
    this.stack.pop();
    if (identifier !== null) {
      this.stack = this.stack.filter((spec) => spec.identifier !== identifier);
    }
    this.launchStackTop();
  }

  purgeIdentifier(identifier: number | string): void {
    const open = this.stack[this.stack.length - 1];
    if (!!open && open.identifier === identifier) {
      this.dismissTop(identifier);
    } else {
      this.stack = this.stack.filter((spec) => spec.identifier !== identifier);
    }
  }

  private launchStackTop() {
    if (this.stack.length) {
      this.make(this.stack[this.stack.length - 1]);
    }
  }

  launch(spec: ModalSpec): void {
    this.topModal?.close();
    this.stack.push(spec);
    this.make(spec);
  }

  private make(spec: ModalSpec) {
    const modalRef = this.modalService.open(
      spec.component,
      DEFAULT_MODAL_OPTIONS
    );
    for (const [input, value] of Object.entries(spec.inputs)) {
      modalRef.componentInstance[input] = value;
    }
    this.topModal = modalRef;
  }
}
