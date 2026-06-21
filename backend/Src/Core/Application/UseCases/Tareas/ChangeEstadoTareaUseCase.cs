using Application.Common.Exceptions;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Tareas;

public interface IChangeEstadoTareaUseCase : IUseCase
{
    Task Execute(int id, ChangeEstadoTareaRequest request);
}

public class ChangeEstadoTareaUseCase : IChangeEstadoTareaUseCase
{
    private const int EstadoCompletadaId = 3;

    private readonly ITareaRepository _tareaRepository;
    private readonly IProyectoRepository _proyectoRepository;

    public ChangeEstadoTareaUseCase(
        ITareaRepository tareaRepository,
        IProyectoRepository proyectoRepository)
    {
        _tareaRepository = tareaRepository;
        _proyectoRepository = proyectoRepository;
    }

    public async Task Execute(int id, ChangeEstadoTareaRequest request)
    {
        var tarea = await _tareaRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Tarea no encontrada.");

        var proyecto = await _proyectoRepository.GetByIdAsync(tarea.ProyectoId)
            ?? throw new NotFoundException("Proyecto no encontrado.");

        if (request.EstadoId == EstadoCompletadaId && EsProyectoCancelado(proyecto.EstadoNombre))
            throw new BusinessException("No se puede completar una tarea si su proyecto esta cancelado.");

        await _tareaRepository.ChangeEstadoAsync(id, request.EstadoId);
    }

    private static bool EsProyectoCancelado(string estadoNombre)
    {
        return string.Equals(estadoNombre, "Cancelada", StringComparison.OrdinalIgnoreCase);
    }
}
