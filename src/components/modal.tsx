import { useState, useEffect, ReactNode } from "react";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

interface ModalProp {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 *
 */
export function Modal(props: ModalProp) {
  const { isOpen, onClose, title, children } = props;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      className="modal"
      overlayClassName="modal-overlay"
      contentLabel="Modal"
    >
      <button className="modal-close" onClick={onClose}>
        X
      </button>
      <div className="modal-header">{title}</div>
      <div className="modal-content">{children}</div>
    </ReactModal>
  );
}
