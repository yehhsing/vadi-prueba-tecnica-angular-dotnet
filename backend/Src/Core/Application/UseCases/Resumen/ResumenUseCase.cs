using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Resumen;

public interface IGetResumenUseCase : IUseCase
{
    Task<ResumenDto> Execute();
}

public class GetResumenUseCase : IGetResumenUseCase
{
    private readonly IResumenRepository _repo;

    public GetResumenUseCase(IResumenRepository repo)
    {
        _repo = repo;
    }

    public async Task<ResumenDto> Execute()
    {
        var resumen = await _repo.GetAsync();

        return new ResumenDto(
            resumen.ProyectosActivos,
            resumen.TareasVencidas,
            resumen.TareasPendientes
        );
    }
}
