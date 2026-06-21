using Application.Common.Exceptions;
using AutoMapper;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Tareas;

public interface IGetTareaByIdUseCase : IUseCase
{
    Task<TareaDto> Execute(int id);
}

public class GetTareaByIdUseCase : IGetTareaByIdUseCase
{
    private readonly ITareaRepository _repo;
    private readonly IMapper _mapper;

    public GetTareaByIdUseCase(ITareaRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<TareaDto> Execute(int id)
    {
        var tarea = await _repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Tarea no encontrada.");

        return _mapper.Map<TareaDto>(tarea);
    }
}
