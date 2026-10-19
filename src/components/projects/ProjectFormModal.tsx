import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { StoredProject } from "../../services/projectService";

interface ProjectFormModalProps {
  isOpen: boolean;
  project?: StoredProject | null;
  onClose: () => void;
  onSubmit: (
    name: string,
    description: string,
  ) => void;
}

export function ProjectFormModal({
  isOpen,
  project,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(project);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setError("");
  }, [isOpen, project]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Informe o nome do projeto.");
      return;
    }

    onSubmit(trimmedName, description.trim());
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {isEditing ? "Editar projeto" : "Novo projeto"}
            </span>

            <h2 id="project-modal-title">
              {isEditing
                ? "Atualizar projeto"
                : "Criar projeto"}
            </h2>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="project-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label htmlFor="project-name">
              Nome do projeto
            </label>

            <input
              id="project-name"
              name="project-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex.: TCC — Sistema de organização"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="project-description">
              Descrição
            </label>

            <textarea
              id="project-description"
              name="project-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Descreva brevemente o objetivo do projeto."
              rows={5}
            />
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              {isEditing
                ? "Salvar alterações"
                : "Criar projeto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}