using Application.Common.Exceptions;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Tareas;

public interface IDeleteTareaUseCase : IUseCase
{
    Task Execute(int id);
}

public class DeleteTareaUseCase : IDeleteTareaUseCase
{
    private readonly ITareaRepository _repo;

    public DeleteTareaUseCase(ITareaRepository repo)
    {
        _repo = repo;
    }

    public async Task Execute(int id)
    {
        _ = await _repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Tarea no encontrada.");

        await _repo.DeleteAsync(id);
    }
}
