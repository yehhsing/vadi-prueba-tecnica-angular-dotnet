using Application.Common.Exceptions;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Proyectos
{
    public interface IDeleteProyectoUseCase : IUseCase
    {
        Task Execute(int id);
    }

    public class DeleteProyectoUseCase : IDeleteProyectoUseCase
    {
        private readonly IProyectoRepository _repo;

        public DeleteProyectoUseCase(IProyectoRepository repo)
        {
            _repo = repo;
        }

        public async Task Execute(int id)
        {
            _ = await _repo.GetByIdAsync(id)
                ?? throw new NotFoundException("Proyecto no encontrado.");

            var hasPendingOrInProgressTasks = await _repo.HasPendingOrInProgressTasksAsync(id);

            if (hasPendingOrInProgressTasks)
                throw new BusinessException("No se puede eliminar un proyecto con tareas pendientes o en progreso.");

            await _repo.DeleteAsync(id);
        }
    }
}
