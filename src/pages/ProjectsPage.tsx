import {
  Archive,
  ArchiveRestore,
  Edit3,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  archiveProject,
  createProject,
  deleteProject,
  getProjects,
  restoreProject,
  updateProject,
  type StoredProject,
} from "../services/projectService";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";

type ProjectFilter = "active" | "archived";

export function ProjectsPage() {
  const [projects, setProjects] = useState<
    StoredProject[]
  >([]);

  const [filter, setFilter] =
    useState<ProjectFilter>("active");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingProject, setEditingProject] =
    useState<StoredProject | null>(null);

  const [openMenuId, setOpenMenuId] = useState<
    string | null
  >(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const visibleProjects = useMemo(() => {
    return projects.filter((project) =>
      filter === "active"
        ? !project.archived
        : project.archived,
    );
  }, [projects, filter]);

  function openCreateModal() {
    setEditingProject(null);
    setOpenMenuId(null);
    setIsModalOpen(true);
  }

  function openEditModal(project: StoredProject) {
    setEditingProject(project);
    setOpenMenuId(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProject(null);
  }

  function handleSubmit(
    name: string,
    description: string,
  ) {
    if (editingProject) {
      updateProject(
        editingProject.id,
        name,
        description,
      );
    } else {
      createProject(name, description);
    }

    setProjects(getProjects());
    closeModal();
  }

  function handleArchive(project: StoredProject) {
    const confirmed = window.confirm(
      `Deseja arquivar o projeto "${project.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    archiveProject(project.id);
    setProjects(getProjects());
    setOpenMenuId(null);
  }

  function handleRestore(project: StoredProject) {
    restoreProject(project.id);
    setProjects(getProjects());
    setOpenMenuId(null);
  }

  function handleDelete(project: StoredProject) {
    const confirmed = window.confirm(
      `Esta ação excluirá definitivamente o projeto "${project.name}". Deseja continuar?`,
    );

    if (!confirmed) {
      return;
    }

    deleteProject(project.id);
    setProjects(getProjects());
    setOpenMenuId(null);
  }

  const activeCount = projects.filter(
    (project) => !project.archived,
  ).length;

  const archivedCount = projects.filter(
    (project) => project.archived,
  ).length;

  return (
    <>
      <section className="page-stack">
        <div className="projects-page-header">
          <div>
            <span className="eyebrow">
              Organização
            </span>

            <h2>Seus projetos</h2>

            <p className="page-description">
              Centralize trabalhos, atividades e informações
              em um único espaço.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Novo projeto
          </button>
        </div>

        <div className="project-filter-bar">
          <button
            type="button"
            className={`project-filter ${
              filter === "active" ? "active" : ""
            }`}
            onClick={() => setFilter("active")}
          >
            Projetos ativos
            <span>{activeCount}</span>
          </button>

          <button
            type="button"
            className={`project-filter ${
              filter === "archived" ? "active" : ""
            }`}
            onClick={() => setFilter("archived")}
          >
            Arquivados
            <span>{archivedCount}</span>
          </button>
        </div>

        {visibleProjects.length === 0 ? (
          <EmptyProjectsState
            filter={filter}
            onCreate={openCreateModal}
          />
        ) : (
          <div className="projects-grid">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isMenuOpen={openMenuId === project.id}
                onMenuToggle={() =>
                  setOpenMenuId((current) =>
                    current === project.id
                      ? null
                      : project.id,
                  )
                }
                onEdit={() =>
                  openEditModal(project)
                }
                onArchive={() =>
                  handleArchive(project)
                }
                onRestore={() =>
                  handleRestore(project)
                }
                onDelete={() =>
                  handleDelete(project)
                }
              />
            ))}
          </div>
        )}
      </section>

      <ProjectFormModal
        isOpen={isModalOpen}
        project={editingProject}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}

interface ProjectCardProps {
  project: StoredProject;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

function ProjectCard({
  project,
  isMenuOpen,
  onMenuToggle,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: ProjectCardProps) {
  return (
    <article
      className={`project-card ${
        project.archived ? "archived" : ""
      }`}
    >
      <div className="project-card-top">
        <div className="project-card-icon">
          <FolderKanban size={20} />
        </div>

        <div className="project-menu-wrapper">
          <button
            type="button"
            className="icon-button"
            onClick={onMenuToggle}
            aria-label={`Ações do projeto ${project.name}`}
            aria-expanded={isMenuOpen}
          >
            <MoreHorizontal size={19} />
          </button>

          {isMenuOpen && (
            <div className="project-menu">
              <button
                type="button"
                onClick={onEdit}
              >
                <Edit3 size={15} />
                Editar
              </button>

              {project.archived ? (
                <button
                  type="button"
                  onClick={onRestore}
                >
                  <ArchiveRestore size={15} />
                  Restaurar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onArchive}
                >
                  <Archive size={15} />
                  Arquivar
                </button>
              )}

              <button
                type="button"
                className="danger-action"
                onClick={onDelete}
              >
                <Trash2 size={15} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="project-card-content">
        <div className="project-card-title-row">
          <h3>{project.name}</h3>

          <span
            className={`project-status ${
              project.archived
                ? "archived-status"
                : ""
            }`}
          >
            {project.archived
              ? "Arquivado"
              : project.status}
          </span>
        </div>

        <p>
          {project.description ||
            "Este projeto ainda não possui uma descrição."}
        </p>
      </div>

      <div className="project-card-progress">
        <div className="project-card-progress-header">
          <span>Progresso</span>
          <strong>{project.progress}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-value"
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </div>

      <div className="project-card-footer">
        <span>
          {project.pendingTasks === 1
            ? "1 tarefa pendente"
            : `${project.pendingTasks} tarefas pendentes`}
        </span>

        <span className="project-id">
          ID: {project.id.slice(0, 14)}...
        </span>
      </div>
    </article>
  );
}

interface EmptyProjectsStateProps {
  filter: ProjectFilter;
  onCreate: () => void;
}

function EmptyProjectsState({
  filter,
  onCreate,
}: EmptyProjectsStateProps) {
  const isArchived = filter === "archived";

  return (
    <div className="projects-empty-state">
      <div className="projects-empty-icon">
        <FolderKanban size={26} />
      </div>

      <h3>
        {isArchived
          ? "Nenhum projeto arquivado"
          : "Você ainda não possui projetos"}
      </h3>

      <p>
        {isArchived
          ? "Quando um projeto for arquivado, ele aparecerá nesta área."
          : "Crie seu primeiro projeto para começar a organizar suas atividades."}
      </p>

      {!isArchived && (
        <button
          type="button"
          className="primary-button"
          onClick={onCreate}
        >
          <Plus size={17} />
          Criar primeiro projeto
        </button>
      )}
    </div>
  );
}