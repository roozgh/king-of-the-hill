import { ReactNode } from "react";
import ReactModal from "react-modal";

if (process.env.NODE_ENV !== "test") {
  ReactModal.setAppElement("#root");
}

interface ModalProp {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  onAfterOpen?: () => void;
}

/**
 *
 */
export function Modal(props: ModalProp) {
  const { isOpen, title, onClose, onAfterOpen, children } = props;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      className="modal"
      overlayClassName="modal-overlay"
      contentLabel="Modal"
      onAfterOpen={onAfterOpen}
    >
      <button className="modal-close" onClick={onClose}>
        X
      </button>
      <div className="modal-header">{title}</div>
      <div className="modal-content">{children}</div>
    </ReactModal>
  );
}
